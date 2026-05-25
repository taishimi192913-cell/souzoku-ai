export default function PrivacyPage() {
  return (
    <div className="flex-1 max-w-2xl mx-auto p-6 text-sm text-gray-600 leading-relaxed">
      <h1 className="text-xl font-bold text-gray-900 mb-4">プライバシーポリシー</h1>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">1. 収集する情報</h2>
        <p>本サービスでは、以下の情報を収集する場合があります。</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>アカウント情報: メールアドレス、表示名（Google ログイン時）</li>
          <li>利用情報: 相続税シミュレーションの入力内容・計算結果</li>
          <li>アクセス情報: IPアドレス、ブラウザ種別、アクセス日時</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">2. 利用目的</h2>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>相続税シミュレーション機能の提供</li>
          <li>AIチャット相談機能の提供</li>
          <li>サービス改善のための分析</li>
          <li>お問い合わせ対応</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">3. 第三者提供</h2>
        <p>法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。ただし、AIチャット機能の提供にあたり、DeepSeek API（外部サービス）に質問内容が送信されます。DeepSeek社のプライバシーポリシーについては同社のウェブサイトをご確認ください。</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">4. データの保存</h2>
        <p>計算履歴はサーバーデータベースに保存されます。ブラウザの localStorage にも一時的に保存されますが、これはユーザー体験向上のためのものであり、ブラウザから削除可能です。</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">5. お問い合わせ</h2>
        <p>プライバシーに関するお問い合わせは、本サービス運営者までご連絡ください。</p>
      </section>

      <section className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h2 className="font-semibold text-yellow-800 mb-2">【重要】免責事項</h2>
        <ul className="list-disc ml-5 space-y-1 text-yellow-800">
          <li>本サービスは相続税の<b>簡易試算ツール</b>であり、税理士法に基づく税務相談・税務代理業務を行うものではありません。</li>
          <li>本サービスによる計算結果は参考値であり、<b>実際の税額を保証するものではありません</b>。</li>
          <li>正確な相続税の計算および申告には、<b>必ず税理士にご相談ください</b>。</li>
          <li>本サービスの利用により生じたいかなる損害についても、運営者は一切の責任を負いません。</li>
          <li>相続税法および関連法令は随時改正される可能性があります。本サービスは最新の法令に完全に対応していることを保証しません。</li>
        </ul>
      </section>
    </div>
  )
}
