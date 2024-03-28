import torch
import transformers
import pandas as pd
import numpy as np
import spacy
import gradio as gr
import googletrans
import os

from torch import cuda, bfloat16
from langchain_community.llms import HuggingFacePipeline
from langchain.document_loaders.csv_loader import CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from transformers import StoppingCriteriaList, MaxLengthCriteria
from googletrans import Translator
from spacy import displacy

model_id = 'meta-llama/Llama-2-7b-chat-hf'
hf_home = "D:/Симулятор собеседования/sobes-sim/huggingface"
os.system('python -m spacy download en_core_web_sm')
os.environ["HF_HOME"] = hf_home
device = f'cuda:{cuda.current_device()}' if cuda.is_available() else 'cpu'
bnb_config = transformers.BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type='nf4',
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=bfloat16
)
hf_auth = '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'
model_config = transformers.AutoConfig.from_pretrained(
    model_id,
    use_auth_token=hf_auth
)
model = transformers.AutoModelForCausalLM.from_pretrained(
    model_id,
    trust_remote_code=True,
    config=model_config,
    quantization_config=bnb_config,
    device_map='auto',
    use_auth_token=hf_auth,
    cache_dir=hf_home
)
model.eval()
tokenizer = transformers.AutoTokenizer.from_pretrained(
    model_id,
    use_auth_token=hf_auth,
    cache_dir=hf_home
)
stop_list = ['\nHuman:', '\n```\n']
stop_token_ids = [tokenizer(x)['input_ids'] for x in stop_list]
stop_token_ids = [torch.LongTensor(x).to(device) for x in stop_token_ids]
class StopOnTokens(StoppingCriteriaList):
    def __call__(self, input_ids: torch.LongTensor, scores: torch.FloatTensor, **kwargs) -> bool:
        for stop_ids in stop_token_ids:
            if torch.eq(input_ids[0][-len(stop_ids):], stop_ids).all():
                return True
        return False
stopping_criteria = StoppingCriteriaList([StopOnTokens()])
generate_text = transformers.pipeline(
    model=model,
    tokenizer=tokenizer,
    return_full_text=True,
    task='text-generation',
    stopping_criteria=stopping_criteria,
    temperature=0.1,
    max_new_tokens=512,
    repetition_penalty=1.1
)
llm = HuggingFacePipeline(pipeline=generate_text)
data = pd.read_json('D:\Симулятор собеседования\sobes-sim\interview QnA.json')
data.to_csv('interviewQna.csv', index=False)
df = pd.read_csv('interviewQna.csv')
df.to_csv("output.csv", index=False)
loader = CSVLoader(file_path='interviewQna.csv')
document = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=20)
all_splits = text_splitter.split_documents(document)
model_name = "sentence-transformers/all-mpnet-base-v2"
model_kwargs = {"device": "cuda"}
embeddings = HuggingFaceEmbeddings(model_name=model_name, model_kwargs=model_kwargs)
vectorstore = FAISS.from_documents(all_splits, embeddings)
chain = ConversationalRetrievalChain.from_llm(llm, vectorstore.as_retriever(), return_source_documents=True)

translator = Translator()

def interview_evaluator(question):
    chat_history = []
    result = chain({"question": question, "chat_history": chat_history})
    translated_answer = translator.translate(result['answer'], dest='ru').text
    return translated_answer

nlp = spacy.load("en_core_web_sm")

def chatbot(text):
    doc = nlp(text)
    html = displacy.render(doc, style="dep", page=True)
    html = (
        "<div style='max-width:100%; max-height:360px; overflow:auto'>"
        + html
        + "</div>"
    )
    pos_count = {
        "char_count": len(text),
        "token_count": 0,
    }
    pos_tokens = []

    for token in doc:
        pos_tokens.extend([(token.text, token.pos_), (" ", None)])

    return pos_tokens, pos_count, html

iface = gr.Interface(

    fn=interview_evaluator,
    inputs=gr.Textbox(lines=2, label="Вопрос", placeholder="Введите запрос:"),
    outputs=gr.Textbox(label="Ответ"),
    title="LAIN AI",
    
)

if __name__ == "__main__":
    iface.launch(share=True)



chain = ConversationalRetrievalChain.from_llm(llm, vectorstore.as_retriever(), return_source_documents=True)

translator = Translator()
