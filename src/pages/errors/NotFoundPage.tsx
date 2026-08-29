import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          404 Error
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          页面不存在
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          你访问的页面不存在，或者地址已经发生变化。
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          返回 Dashboard
        </Link>
      </div>
    </section>
  )
}