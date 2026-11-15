"""Build the one-page portfolio brief; URLs can be overridden for future hosting."""
import argparse
from pathlib import Path
import shutil
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parents[1]
NAME='Karan_Verma_Hollywood_Luck_Lab_Work_Sample.pdf'

def build():
    parser=argparse.ArgumentParser()
    parser.add_argument('--site',default='https://kv304.github.io/hollywood-luck-lab')
    parser.add_argument('--repo',default='https://github.com/kv304/hollywood-luck-lab')
    args=parser.parse_args()
    fonts=Path('/Users/karanverma/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/Resources/fonts/truetype')
    # Use embedded fonts if the bundled desktop runtime is available; standard PDF fonts otherwise.
    regular,bold='Helvetica','Helvetica-Bold'
    if fonts.exists():
        pdfmetrics.registerFont(TTFont('BriefSans',str(fonts/'LiberationSans-Regular.ttf')))
        pdfmetrics.registerFont(TTFont('BriefSansBold',str(fonts/'LiberationSans-Bold.ttf')))
        regular,bold='BriefSans','BriefSansBold'
    output=ROOT/'output/pdf'/NAME;output.parent.mkdir(parents=True,exist_ok=True)
    c=canvas.Canvas(str(output),pagesize=(612,792))
    c.setTitle('Hollywood Luck Lab | Karan Verma | Work Sample')
    c.setAuthor('Karan Verma')
    paper,ink,purple,coral=map(HexColor,['#fff8ed','#26143e','#7550e8','#ff7757'])
    c.setFillColor(paper);c.rect(0,0,612,792,fill=1,stroke=0)
    def text(x,y,value,size=10,font=None,color=ink):
        c.setFillColor(color);c.setFont(font or regular,size);c.drawString(x,y,value)
    def paragraph(x,top,width,value,size=10,leading=14,color=ink):
        style=ParagraphStyle('body',fontName=regular,fontSize=size,leading=leading,textColor=color)
        p=Paragraph(value,style);_,height=p.wrap(width,1000);p.drawOn(c,x,top-height);return top-height
    def heading(x,y,title):text(x,y,title,12,bold,purple)
    text(38,754,'KARAN VERMA  /  USC COMM 502  /  WORKING PROTOTYPE',9,bold,purple)
    text(36,712,'Hollywood Luck Lab',35,bold)
    paragraph(38,690,535,'An interactive entertainment-data product for exploring film-performance judgments, evidence, and model uncertainty.',12,17)
    c.setStrokeColor(coral);c.setLineWidth(3);c.line(38,637,574,637)
    c.drawImage(str(ROOT/'public/portfolio-preview.png'),38,411,width=536,height=215,mask='auto',preserveAspectRatio=True,anchor='c')
    text(38,396,'Working forecast game: make a call, inspect the outcome, and examine the model.',8.5,regular,HexColor('#6e5b7d'))
    heading(38,370,'The question')
    paragraph(38,356,536,'How well can we judge film performance, and what changes when we inspect the evidence?',11,15)
    left,right,width=38,320,254
    heading(left,313,'What works today')
    y=paragraph(left,299,width,'Interactive probability forecasts and outcome reveals; a searchable career explorer; sourced executive timelines; model sensitivities, historical calibration groups, and CSV exports.',10,14)
    heading(left,y-25,'Engineering and validation')
    paragraph(left,y-39,width,'Python, NumPy, and scikit-learn data/modeling pipeline; static JavaScript interface; chronological model comparison on 538 later-release films; reproducible checks for predictions, leakage boundaries, explanations, and career aggregates.',10,14)
    heading(right,313,'My role and AI assistance')
    y=paragraph(right,299,width,'I shaped the questions and use cases, connected the project to communication coursework, and iterated the experience. AI assisted research, implementation, debugging, and test development. Source and validation methods are inspectable.',10,14)
    heading(right,y-25,'Scope and limitations')
    paragraph(right,y-39,width,'Exploratory prototype using selected historical data. The observed prediction gain is modest and uncertain. Gross/budget is not profit; credited careers and timelines do not isolate ability or measure luck. No user study has established a learning benefit.',10,14)
    c.setStrokeColor(HexColor('#d9cae4'));c.setLineWidth(.7);c.line(38,108,574,108)
    links=[('DEMO',args.site+'/portfolio.html',38),('CODE',args.repo,221),('METHODOLOGY',args.site+'/methodology.html',387)]
    for label,url,x in links:
        text(x,85,label,10,bold,purple)
        c.linkURL(url,(x,76,x+154,101),relative=0,thickness=0)
    text(38,56,'November 2026  |  Python + JavaScript  |  Independent educational project',8.5,regular,HexColor('#6e5b7d'))
    c.save()
    deployed=ROOT/'public/work-sample'/NAME;deployed.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(output,deployed)
    print(output)

if __name__=='__main__':build()
