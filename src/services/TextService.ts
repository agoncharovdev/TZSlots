import {AbstractText, Color, FillGradient, type StrokeAttributes, Text, TextStyle, type TextStyleAlign} from "pixi.js";
import {Main} from "../main.ts";

export class TextService {

    plainText(txt: string, maxWidth: number, maxHeight: number, align:TextStyleAlign = 'center', fontSize = 75) {
        const style = new TextStyle({
            align: align,
            fontFamily: 'Arial',
            fontSize: Main.adapt(fontSize),
            fontWeight: 'bold',
            fill: { color: 0xffffff },
            stroke: { color: 0x000000, width: 5 },
            wordWrap: false,
        });
        let textField = new Text(txt, style);
        this.fitText(textField, maxWidth, maxHeight);
        return textField;
    }

    buttonText(txt: string, maxWidth: number, maxHeight: number, align:TextStyleAlign = 'center', fontSize = 75) {
        const fill = new FillGradient(0, 0, 0, 2);
        const colors = [0xffffff, 0x00ff99].map((color) => Color.shared.setValue(color).toNumber());
        colors.forEach((number, index) => {
            const ratio = index / colors.length;
            fill.addColorStop(ratio, number);
        });

        const style = new TextStyle({
            align: align,
            fontFamily: 'Arial',
            fontSize: Main.adapt(fontSize),
            // fontStyle: 'italic',
            fontWeight: 'bold',
            fill: { fill },
            stroke: { color: 0x4a1850, width: 5 },
            dropShadow: {
                color: 0x000000,
                angle: Math.PI / 6,
                blur: 4,
                distance: 6,
            },
            wordWrap: true,
            wordWrapWidth: maxWidth,
        });

        let textField = new Text(txt, style);
        this.fitText(textField, maxWidth, maxHeight);

        return textField;
    }

    private fitText(text:AbstractText, areaWidth:number, areaHeight:number) {
        const originalStyle = text.style.clone();
        let fontSize = originalStyle.fontSize || 16; // Начальный размер шрифта
        let wordWrapWidth = areaWidth; // Начальная ширина переноса
        // Итеративно уменьшаем размер шрифта, пока текст не впишется в область
        while (true) {
            text.style.fontSize = fontSize;
            let stroke = text.style.stroke as StrokeAttributes;
            if (stroke) {
                let newStroke = { ...stroke };
                newStroke.width = fontSize / 3;
                text.style.stroke = newStroke;
            }
            text.style.wordWrapWidth = wordWrapWidth;
            // Проверяем размеры текста
            const bounds = text.getSize();
            // console.warn(fontSize, bounds, this.areaWidth, this.areaHeight);
            if (bounds.width <= areaWidth && bounds.height <= areaHeight) {
                break; // Текст помещается
            }
            fontSize--; // Уменьшаем шрифт
            if (fontSize < 8) {
                // console.warn('Text could not fit within the specified area');
                break;
            }
        }
    }
}