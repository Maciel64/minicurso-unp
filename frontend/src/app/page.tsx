"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { API_URL } from "@/lib/api"
import { Users, ReceiptText, ArrowRight, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react"

export default function Home() {
  const [stats, setStats] = useState({
    usersCount: 0,
    billingsCount: 0,
    totalPaid: 0,
    pendingCount: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, billingsRes] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/billings`)
        ])
        const users = await usersRes.json()
        const billings = await billingsRes.json()

        const paidBillings = billings.filter((b: any) => b.status === 'PAID')
        const pendingBillings = billings.filter((b: any) => b.status === 'PENDING')

        setStats({
          usersCount: users.length,
          billingsCount: billings.length,
          totalPaid: paidBillings.reduce((acc: number, curr: any) => acc + curr.value, 0),
          pendingCount: pendingBillings.length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="relative overflow-hidden bg-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-indigo-500/40">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Bem-vindo ao BillingHub
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl leading-relaxed mb-8">
            Gerencie seus usuários e cobranças de forma simples, rápida e segura. 
            Integração nativa com Asaas para pagamentos automatizados.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/users" 
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group"
            >
              Gerenciar Usuários
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/billings" 
              className="bg-indigo-500/50 hover:bg-indigo-500/70 text-white border border-indigo-400/30 px-6 py-3 rounded-xl font-bold transition-all"
            >
              Ver Cobranças
            </Link>
          </div>
        </div>
        
        {/* Abstract background shape */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Usuários" 
          value={stats.usersCount} 
          icon={<Users size={24} />} 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Cobranças Geradas" 
          value={stats.billingsCount} 
          icon={<ReceiptText size={24} />} 
          color="bg-purple-50 text-purple-600"
        />
        <StatCard 
          title="Valor Recebido" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalPaid)} 
          icon={<TrendingUp size={24} />} 
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Pendentes" 
          value={stats.pendingCount} 
          icon={<Clock size={24} />} 
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-indigo-600" />
            Próximos Passos
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <p className="text-gray-600 dark:text-gray-400">
                Cadastre um novo usuário na aba <Link href="/users" className="text-indigo-600 font-medium hover:underline">Usuários</Link>.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <p className="text-gray-600 dark:text-gray-400">
                Gere uma cobrança para esse usuário na aba <Link href="/billings" className="text-indigo-600 font-medium hover:underline">Cobranças</Link>.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <p className="text-gray-600 dark:text-gray-400">
                Acompanhe o status do pagamento em tempo real através dos nossos Webhooks integrados.
              </p>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Dica do Sistema</h2>
          <p className="text-gray-500 max-w-xs">
            Você pode testar o fluxo de pagamento usando o link da fatura no ambiente de Sandbox do Asaas.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
