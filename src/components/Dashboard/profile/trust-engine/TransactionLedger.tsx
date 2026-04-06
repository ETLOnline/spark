"use client"

import { ArrowUpRight } from "lucide-react"
import { TransactionsData, TransactionType } from "./Constant"
import { Badge } from "../../../ui/badge"
import { Card } from "../../../ui/card"
import { Tabs, TabsContent } from "../../../ui/tabs"
const categoryColors: Record<string, string> = {
  engagement: "bg-blue-50 text-blue-700 border-blue-200",
  project: "bg-green-50 text-green-700 border-green-200",
  skill: "bg-purple-50 text-purple-700 border-purple-200",
  purchase: "bg-orange-50 text-orange-700 border-orange-200",
  reward: "bg-yellow-50 text-yellow-700 border-yellow-200"
}

export function TransactionLedger() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">
        Transaction History
      </h3>
      {TransactionsData.map((transaction) => (
        <TransactionRow key={transaction.id} transaction={transaction} />
      ))}
    </Card>
  )
}

function TransactionRow({ transaction }: { transaction: TransactionType }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div
        className={`p-2 rounded-lg flex items-center justify-center w-10 h-10 border`}
      >
        <ArrowUpRight className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground">
            {transaction.title}
          </h4>
          <Badge variant="outline" className="text-xs">
            {transaction.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {transaction.description}
        </p>
        <p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        {transaction.rpAmount && (
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            <ArrowUpRight className="w-4 h-4" />+{transaction.rpAmount} RP
          </div>
        )}
        {transaction.scAmount && (
          <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
            <ArrowUpRight className="w-4 h-4" />+{transaction.scAmount} SC
          </div>
        )}
      </div>
    </div>
  )
}
