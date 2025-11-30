'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, DollarSign, ShoppingBag, Users, Activity } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

const data = [
  { name: 'Jan', total: 1200 },
  { name: 'Fev', total: 2100 },
  { name: 'Mar', total: 1800 },
  { name: 'Avr', total: 2400 },
  { name: 'Mai', total: 3200 },
  { name: 'Juin', total: 4500 },
  { name: 'Juil', total: 4100 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Dernière mise à jour : Aujourd'hui à 10:42</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231.89 €</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1 text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +20.1% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1 text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +180.1% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1 text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +19% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1 text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +201 depuis la dernière heure
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Recent Sales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Aperçu des Ventes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}€`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="total" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ventes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[
                { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+1,999.00€' },
                { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+39.00€' },
                { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+299.00€' },
                { name: 'William Kim', email: 'will@email.com', amount: '+99.00€' },
                { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+39.00€' },
              ].map((sale, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                    {sale.name.charAt(0)}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{sale.name}</p>
                    <p className="text-xs text-muted-foreground">{sale.email}</p>
                  </div>
                  <div className="ml-auto font-medium">{sale.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
