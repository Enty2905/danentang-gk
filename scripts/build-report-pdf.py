from pathlib import Path
from html import escape
import re
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, KeepTogether

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'submission' / 'BAO_CAO.md'
OUTPUT = ROOT / 'submission' / 'BAO_CAO.pdf'
pdfmetrics.registerFont(TTFont('ArialVN', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialVNBold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFont(TTFont('ConsolasVN', 'C:/Windows/Fonts/consola.ttf'))
styles = {
    'body': ParagraphStyle('body', fontName='ArialVN', fontSize=10.5, leading=15.5, spaceAfter=8),
    'title': ParagraphStyle('title', fontName='ArialVNBold', fontSize=22, leading=29, spaceAfter=18),
    'heading': ParagraphStyle('heading', fontName='ArialVNBold', fontSize=14, leading=19, spaceBefore=12, spaceAfter=9, keepWithNext=True),
    'caption': ParagraphStyle('caption', fontName='ArialVN', fontSize=9.5, leading=13, spaceAfter=7),
    'code': ParagraphStyle('code', fontName='ConsolasVN', fontSize=8.4, leading=12, leftIndent=8, spaceAfter=3, wordWrap='CJK'),
    'cell': ParagraphStyle('cell', fontName='ArialVN', fontSize=9.5, leading=14),
    'headcell': ParagraphStyle('headcell', fontName='ArialVNBold', fontSize=9.5, leading=14),
}

def text(value):
    return escape(value.replace('`', '').replace('**', ''))

story = []
lines = SOURCE.read_text(encoding='utf-8-sig').splitlines()
i = 0
while i < len(lines):
    line = lines[i].strip()
    if not line:
        i += 1
        continue
    if line.startswith('# '):
        story.append(Paragraph(text(line[2:]), styles['title']))
    elif line.startswith('## '):
        story.append(Paragraph(text(line[3:]), styles['heading']))
    elif line.startswith('```'):
        block = []
        i += 1
        while i < len(lines) and not lines[i].startswith('```'):
            block.append(Paragraph(text(lines[i]), styles['code']))
            i += 1
        if story and isinstance(story[-1], Paragraph) and story[-1].style is styles['heading']:
            block.insert(0, story.pop())
        story.append(KeepTogether(block + [Spacer(1, 8)]))
    elif line.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].strip().startswith('|'):
            row = [item.strip() for item in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[-: ]+', cell) for cell in row):
                rows.append(row)
            i += 1
        rendered = [[Paragraph(text(cell), styles['headcell' if r == 0 else 'cell']) for cell in row] for r, row in enumerate(rows)]
        table = Table(rendered, colWidths=[70, 47, 366], repeatRows=1, hAlign='LEFT')
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d9d9d9')),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e9ecef')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.extend([table, Spacer(1, 12)])
        continue
    elif line.startswith('!['):
        match = re.match(r'!\[(.*?)\]\((.*?)\)', line)
        path = SOURCE.parent / match.group(2)
        if path.exists():
            image = Image(str(path))
            ratio = min(483 / image.imageWidth, 350 / image.imageHeight)
            image.drawWidth = image.imageWidth * ratio
            image.drawHeight = image.imageHeight * ratio
            image.hAlign = 'LEFT'
            story.append(KeepTogether([Paragraph(text(match.group(1)), styles['caption']), image, Spacer(1, 16)]))
    else:
        story.append(Paragraph(text(line), styles['body']))
    i += 1

def footer(canvas, document):
    canvas.setFont('ArialVN', 8)
    canvas.setFillColor(colors.HexColor('#666666'))
    canvas.drawRightString(A4[0] - 56, 29, f'{document.page}')

document = SimpleDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=56, rightMargin=56, topMargin=46, bottomMargin=46, title='Báo cáo giữa kỳ Lập trình đa nền tảng', author='')
document.build(story, onFirstPage=footer, onLaterPages=footer)
print('Created submission/BAO_CAO.pdf')
