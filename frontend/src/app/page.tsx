"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { API_URL } from "@/lib/api"
import { Users, ReceiptText, ArrowRight, TrendingUp, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react"

export default function Home() {
  // Fetch Stats using React Query
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const [usersRes, billingsRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/billings`)
      ])
      const users = await usersRes.json()
      const billings = await billingsRes.json()

      const paidBillings = billings.filter((b: any) => b.status === 'PAID')
      const pendingBillings = billings.filter((b: any) => b.status === 'PENDING')

      return {
        usersCount: users.length,
        billingsCount: billings.length,
        totalPaid: paidBillings.reduce((acc: number, curr: any) => acc + curr.value, 0),
        pendingCount: pendingBillings.length,
      }
    },
    refetchInterval: 5000,
  })

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
        <p className="text-gray-500 font-medium">Carregando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="relative overflow-hidden bg-brand-blue rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-brand-blue/40">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Bem-vindo ao BillingHub
          </h1>
          <p className="text-brand-yellow/90 text-lg md:text-xl leading-relaxed mb-8">
            Gerencie seus usuários e cobranças de forma simples, rápida e segura. 
            Integração nativa com Asaas para pagamentos automatizados.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/users" 
              className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group"
            >
              Gerenciar Usuários
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/billings" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-bold transition-all"
            >
              Ver Cobranças
            </Link>
          </div>
        </div>
        
        {/* Abstract background shape */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Usuários" 
          value={stats?.usersCount ?? 0} 
          icon={<Users size={24} />} 
          color="bg-brand-blue/5 text-brand-blue border-brand-blue/10"
        />
        <StatCard 
          title="Cobranças Geradas" 
          value={stats?.billingsCount ?? 0} 
          icon={<ReceiptText size={24} />} 
          color="bg-brand-yellow/5 text-brand-blue border-brand-yellow/20"
        />
        <StatCard 
          title="Valor Recebido" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalPaid ?? 0)} 
          icon={<TrendingUp size={24} />} 
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <StatCard 
          title="Pendentes" 
          value={stats?.pendingCount ?? 0} 
          icon={<Clock size={24} />} 
          color="bg-amber-50 text-amber-600 border-amber-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-brand-blue" />
            Próximos Passos
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-brand-blue/20">1</div>
              <p className="text-gray-600 dark:text-gray-400">
                Cadastre um novo usuário na aba <Link href="/users" className="text-brand-blue font-medium hover:underline">Usuários</Link>.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-brand-blue/20">2</div>
              <p className="text-gray-600 dark:text-gray-400">
                Gere uma cobrança para esse usuário na aba <Link href="/billings" className="text-brand-blue font-medium hover:underline">Cobranças</Link>.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-brand-blue/20">3</div>
              <p className="text-gray-600 dark:text-gray-400">
                Acompanhe o status do pagamento em tempo real através dos nossos Webhooks integrados.
              </p>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100 dark:border-gray-800">
            <AlertCircle size={32} className="opacity-50" />
          </div>
          <h2 className="text-xl font-bold mb-2">Dica do Sistema</h2>
          <p className="text-gray-500 max-w-xs text-sm">
            Você pode testar o fluxo de pagamento usando o link da fatura no ambiente de Sandbox do Asaas.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}
