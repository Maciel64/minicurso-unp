"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { API_URL } from "@/lib/api"
import { ReceiptText, User, DollarSign, ExternalLink, Calendar, Loader2, X, CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface Billing {
  id: string
  userId: string
  value: number
  link: string
  externalId: string
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  paidAt: string | null
  dueAt: string | null
  createdAt: string
  user: {
    name: string
    email: string
  }
}

interface SimpleUser {
  id: string
  name: string
}

export default function BillingsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    userId: "",
    value: "",
  })

  // Fetch Billings with 5s polling
  const { data: billings = [], isLoading: isLoadingBillings } = useQuery<Billing[]>({
    queryKey: ['billings'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/billings`)
      return res.json()
    },
    refetchInterval: 5000,
  })

  // Fetch Users
  const { data: users = [] } = useQuery<SimpleUser[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users`)
      return res.json()
    },
  })

  // Mutation to create billing
  const createBillingMutation = useMutation({
    mutationFn: async (newBilling: { userId: string, value: number }) => {
      const response = await fetch(`${API_URL}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBilling),
      })
      if (!response.ok) throw new Error("Failed to create billing")
      return response.json()
    },
    onSuccess: () => {
      setIsModalOpen(false)
      setFormData({ userId: "", value: "" })
      queryClient.invalidateQueries({ queryKey: ['billings'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createBillingMutation.mutate({
      userId: formData.userId,
      value: Number(formData.value)
    })
  }

  const getStatusBadge = (status: Billing['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600/80 border border-emerald-200/50">
            <CheckCircle2 size={12} className="opacity-70" />
            PAGO
          </span>
        )
      case 'PENDING':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-brand-yellow/10 text-brand-blue/80 border border-brand-yellow/30">
            <Clock size={12} className="opacity-70" />
            PENDENTE
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600/80 border border-rose-200/50">
            <AlertCircle size={12} className="opacity-70" />
            CANCELADO
          </span>
        )
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-blue dark:text-white">Cobranças</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Acompanhe e gere cobranças para seus clientes.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-blue/20 active:scale-95"
        >
          <ReceiptText size={20} />
          Gerar Cobrança
        </button>
      </div>

      {isLoadingBillings ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-brand-blue" size={40} />
          <p className="text-gray-500 font-medium">Carregando cobranças...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimento</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {billings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                      Nenhuma cobrança encontrada.
                    </td>
                  </tr>
                ) : (
                  billings.map((billing) => (
                    <tr key={billing.id} className="hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">{billing.user.name}</span>
                          <span className="text-xs text-gray-500">{billing.user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 font-semibold text-brand-blue/90">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(billing.value)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(billing.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar size={14} className="opacity-60" />
                          {billing.dueAt ? new Date(billing.dueAt).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={billing.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue/80 hover:text-brand-blue transition-colors bg-brand-blue/5 dark:bg-brand-yellow/10 px-3 py-1.5 rounded-lg border border-brand-blue/10 dark:border-brand-yellow/20"
                        >
                          Ver Fatura
                          <ExternalLink size={14} className="opacity-70" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-brand-blue dark:text-white">Gerar Nova Cobrança</h3>
                <p className="text-gray-500 text-sm">Escolha o cliente e o valor da cobrança.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all appearance-none"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  >
                    <option value="">Selecione um cliente</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Valor (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="bg-brand-blue/5 dark:bg-brand-yellow/5 p-4 rounded-xl border border-brand-blue/10 dark:border-brand-yellow/10">
                <p className="text-xs text-brand-blue/70 dark:text-brand-yellow/80 leading-relaxed">
                  <strong>Aviso:</strong> A cobrança será gerada via Asaas e o cliente receberá um e-mail com o link para pagamento.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  disabled={createBillingMutation.isPending || !formData.userId}
                  type="submit"
                  className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                >
                  {createBillingMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Gerar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
