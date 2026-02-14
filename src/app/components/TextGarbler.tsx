import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Copy, Shuffle } from 'lucide-react';
import { toast } from 'sonner';

type GarblerType = 'mojibake' | 'zalgo' | 'broken' | 'square' | 'random' | 'shift-jis';

export function TextGarbler() {
  const [inputText, setInputText] = useState('');
  const [garblerType, setGarblerType] = useState<GarblerType>('mojibake');
  const [outputText, setOutputText] = useState('');

  const garbleText = (text: string, type: GarblerType): string => {
    if (!text) return '';

    switch (type) {
      case 'mojibake':
        // UTF-8 -> Shift_JIS風の文字化け風
        return text.split('').map(char => {
          const code = char.charCodeAt(0);
          if (code >= 0x3040 && code <= 0x309F) { // ひらがな
            return String.fromCharCode(0xFF00 + Math.floor(Math.random() * 96));
          } else if (code >= 0x30A0 && code <= 0x30FF) { // カタカナ
            return String.fromCharCode(0x2200 + Math.floor(Math.random() * 256));
          } else if (code >= 0x4E00 && code <= 0x9FFF) { // 漢字
            return '縺' + String.fromCharCode(0x3040 + Math.floor(Math.random() * 96));
          }
          return char;
        }).join('');

      case 'zalgo':
        // Zalgo text - 文字に上下の記号を追加
        const zalgoMarks = [
          '\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306', '\u0307',
          '\u0308', '\u0309', '\u030A', '\u030B', '\u030C', '\u030D', '\u030E', '\u030F',
          '\u0310', '\u0311', '\u0312', '\u0313', '\u0314', '\u0315', '\u0316', '\u0317',
          '\u0318', '\u0319', '\u031A', '\u031B', '\u031C', '\u031D', '\u031E', '\u031F',
          '\u0320', '\u0321', '\u0322', '\u0323', '\u0324', '\u0325', '\u0326', '\u0327',
          '\u0328', '\u0329', '\u032A', '\u032B', '\u032C', '\u032D', '\u032E', '\u032F',
          '\u0330', '\u0331', '\u0332', '\u0333', '\u0334', '\u0335', '\u0336', '\u0337',
          '\u0338', '\u0339', '\u033A', '\u033B', '\u033C', '\u033D', '\u033E', '\u033F'
        ];
        return text.split('').map(char => {
          let result = char;
          const numMarks = Math.floor(Math.random() * 8) + 3;
          for (let i = 0; i < numMarks; i++) {
            result += zalgoMarks[Math.floor(Math.random() * zalgoMarks.length)];
          }
          return result;
        }).join('');

      case 'broken':
        // ランダムに文字を欠損させる
        return text.split('').map(char => {
          const rand = Math.random();
          if (rand < 0.3) return '□';
          if (rand < 0.4) return '?';
          if (rand < 0.5) return '・';
          return char;
        }).join('');

      case 'square':
        // 全て□に置き換え（一部だけ残す）
        return text.split('').map(char => {
          if (char === ' ' || char === '\n') return char;
          return Math.random() < 0.8 ? '□' : char;
        }).join('');

      case 'random':
        // ランダムな Unicode 文字に置き換え
        return text.split('').map(char => {
          if (char === ' ' || char === '\n') return char;
          const ranges = [
            [0x4E00, 0x4F00], // 漢字の一部
            [0x30A0, 0x30FF], // カタカナ
            [0x0400, 0x04FF], // キリル文字
            [0x0600, 0x06FF], // アラビア文字
            [0x3040, 0x309F], // ひらがな
          ];
          const range = ranges[Math.floor(Math.random() * ranges.length)];
          return String.fromCharCode(
            range[0] + Math.floor(Math.random() * (range[1] - range[0]))
          );
        }).join('');

      case 'shift-jis':
        // Shift_JIS エンコードエラー風
        return text.split('').map(char => {
          const code = char.charCodeAt(0);
          if (code > 127) {
            const chars = ['繧', '縺', '�', '�', '�', '�'];
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        }).join('');

      default:
        return text;
    }
  };

  const handleGarble = () => {
    const garbled = garbleText(inputText, garblerType);
    setOutputText(garbled);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast.success('コピーしました！');
    } catch (err) {
      toast.error('コピーに失敗しました');
    }
  };

  const garblerOptions = [
    { value: 'mojibake', label: '文字化け（日本語風）' },
    { value: 'shift-jis', label: 'Shift_JISエラー風' },
    { value: 'zalgo', label: 'Zalgo（悪魔文字）' },
    { value: 'broken', label: '文字欠損' },
    { value: 'square', label: '豆腐化（□）' },
    { value: 'random', label: 'ランダム文字' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>文字化けジェネレーター</CardTitle>
          <CardDescription>
            普通の文章を様々なパターンで文字化けさせることができます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-text">元の文章</Label>
            <Textarea
              id="input-text"
              placeholder="ここに文章を入力してください..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="garbler-type">文字化けのタイプ</Label>
            <Select value={garblerType} onValueChange={(value) => setGarblerType(value as GarblerType)}>
              <SelectTrigger id="garbler-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {garblerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGarble}
            disabled={!inputText}
            className="w-full"
          >
            <Shuffle className="mr-2 size-4" />
            文字化けさせる
          </Button>

          {outputText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="output-text">文字化け結果</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="mr-2 size-4" />
                  コピー
                </Button>
              </div>
              <Textarea
                id="output-text"
                value={outputText}
                readOnly
                rows={6}
                className="resize-none bg-muted"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
