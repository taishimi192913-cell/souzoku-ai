export default function TermsPage() {
  return (
    <div className="flex-1 max-w-2xl mx-auto p-6 text-sm text-gray-600 leading-relaxed">
      <h1 className="text-xl font-bold text-gray-900 mb-4">利用規約</h1>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">第1条（適用）</h2>
        <p>本利用規約は、相続税AI（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">第2条（サービスの性質）</h2>
        <p>本サービスは、相続税の参考情報および簡易試算を提供するものです。</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>本サービスは<b>税理士法に基づく税務相談・税務代理業務ではありません</b>。</li>
          <li>計算結果は<b>概算値</b>であり、実際の税額を保証するものではありません。</li>
          <li>実際の税務申告や相続手続きについては、<b>必ず税理士・弁護士等の専門家にご相談ください</b>。</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">第3条（免責）</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>本サービスの情報に基づいてユーザーが行った判断・行動により生じたいかなる損害についても、運営者は一切の責任を負いません。</li>
          <li>本サービスは予告なく内容の変更・提供の中断・終了を行うことがあります。</li>
          <li>AIによる回答には誤りが含まれる可能性があります。重要な判断には必ず専門家の確認を得てください。</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">第4条（禁止事項）</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>法令または公序良俗に違反する行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>他のユーザーまたは第三者の権利を侵害する行為</li>
          <li>サーバーに過度な負荷をかける行為（スクレイピング等）</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">第5条（準拠法・管轄）</h2>
        <p>本規約は日本法に準拠し、本サービスに関する紛争は東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
      </section>
    </div>
  )
}
