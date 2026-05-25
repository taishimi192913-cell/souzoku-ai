import Link from "next/link"

export default function Home() {
  return (
    <div className="flex-1">
      <section className="bg-gradient-to-b from-blue-50 to-white px-6 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          相続税のシミュレーション、
          <br />
          <span className="text-blue-600">3分で完了</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-lg mx-auto">
          家族構成と資産を入力するだけで、相続税額と節税方法をAIが自動計算。根拠条文付きでわかりやすく。
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/simulator"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors no-underline shadow-md"
          >
            無料で試す
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">3ステップでかんたん試算</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "家族を入力", desc: "配偶者・子供など相続人の続柄と年齢を入力" },
            { step: "02", title: "資産を入力", desc: "不動産・預貯金・有価証券などを万円単位で入力" },
            { step: "03", title: "結果を確認", desc: "税額の内訳と節税提案をAIが自動生成" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">{s.step}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">主な機能</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: "📊", title: "相続税シミュレーター", desc: "基礎控除・累進税率・各種特例に対応した正確な計算" },
              { icon: "💬", title: "AI法律相談", desc: "条文を引用して相続税の疑問に回答（チャット形式）" },
              { icon: "🏠", title: "小規模宅地特例", desc: "居住用宅地330㎡まで80%評価減を自動計算" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">料金</h2>
        <p className="text-gray-500 mb-6">現在はβ版として全機能を無料でご利用いただけます。</p>
        <div className="max-w-xs mx-auto bg-white rounded-xl border-2 border-blue-200 p-6">
          <h3 className="font-semibold text-gray-900">Free プラン</h3>
          <p className="text-3xl font-bold text-blue-600 my-3">¥0</p>
          <ul className="text-sm text-gray-500 space-y-1 mb-6">
            <li>相続税シミュレーション</li>
            <li>AIチャット相談</li>
            <li>節税提案</li>
          </ul>
          <Link
            href="/simulator"
            className="block w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors no-underline"
          >
            始める
          </Link>
        </div>
      </section>
    </div>
  )
}
