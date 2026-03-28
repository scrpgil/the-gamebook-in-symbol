# The World is a Gamebook in Symbol

## プロジェクト概要

Symbolブロックチェーン上にゲームブック（番地とメッセージ）を記録・閲覧するWebアプリ。

## 技術スタック

- **フレームワーク**: Next.js 14 (Pages Router, SSRなし・クライアントサイドのみ)
- **UI**: Ionic React 7 + Tailwind CSS 3.4
- **ブロックチェーン**: Symbol SDK 1.0.3 (ピン留め、v3はAPI互換なし)
- **モバイル**: Capacitor 6 (iOS/Android)
- **言語**: TypeScript 5
- **デプロイ**: Vercel (static export)

## ビルド・開発

```bash
npm run dev    # 開発サーバー
npm run build  # ビルド (output: 'export' で静的出力)
```

## デプロイブランチ

- `deploy/staging` → Vercel staging (テストネット)
- `deploy/prod` → Vercel production (メインネット)
- `main` → 開発ブランチ。デプロイ時は上記ブランチにpush

## 環境変数 (Vercelで設定)

| 変数名 | 説明 | staging デフォルト |
|---|---|---|
| `NEXT_PUBLIC_NODE_URL` | SymbolノードURL | `https://001-sai-dual.symboltest.net:3001` |
| `NEXT_PUBLIC_NUMBERING_ADDRESS` | 番地管理アドレス | `TD6Y6MAG4AR2CMWJWQ3DZP3PT5QZ74TDUTNSKPY` |
| `NEXT_PUBLIC_SYMBOL_EXPLORER` | ExplorerのURL | `https://testnet.symbol.fyi/` |

Production環境では以下を設定:
- `NEXT_PUBLIC_NODE_URL` = `https://xym.allnodes.me:3001`
- `NEXT_PUBLIC_NUMBERING_ADDRESS` = `NC3F3E2EZT4JRPLUSYMD2QHWKW353GJUBP2NSPA`
- `NEXT_PUBLIC_SYMBOL_EXPLORER` = `https://symbol.fyi/`

## ディレクトリ構成

- `pages/` - Next.jsページ (index, catch-all)
- `components/` - UIコンポーネント (AppShell, Home, 各UI部品)
- `services/` - Symbol SDK連携、定数、ユーティリティ
- `store/` - Pullstate による状態管理
- `styles/` - グローバルCSS、Ionic変数

## 注意事項

- `symbol-sdk` はv1.0.3にピン留め。v3はAPI全面変更のため移行不可
- アプリは全ページ `dynamic(() => import(...), { ssr: false })` でCSRのみ
- `services/const.ts` は環境変数で値を切り替え (旧シンボリックリンク方式から移行済み)
