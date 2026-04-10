"use client"

import { ArrowUpRight } from "lucide-react"
import { Badge } from "../../../ui/badge"
import { Card } from "../../../ui/card"
import { formatActivityName } from "@/src/utils/clientHelper"

interface TransactionProps {
  transection_id: number
  reward_id: number
  amount: number
  transection_type: string
  created_at: string
  rule?: {
    action_display_name: string
    category_group: string
    description: string
  }
}

export function TransactionLedger({
  TransactionsData
}: {
  TransactionsData: TransactionProps[]
}) {
  const data = Array.isArray(TransactionsData) ? TransactionsData : []

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">
        Transaction History
      </h3>
      {data.map((transaction) => (
        <TransactionRow
          key={transaction.transection_id}
          transaction={transaction}
        />
      ))}
      {data.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No transactions found.
        </p>
      )}
    </Card>
  )
}

function TransactionRow({ transaction }: { transaction: TransactionProps }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-lg flex items-center justify-center w-10 h-10 border">
        <ArrowUpRight className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground">
            {transaction.rule?.action_display_name ?? "Reward"}
          </h4>
          <Badge variant="outline" className="text-xs">
            {formatActivityName(transaction.rule?.category_group ?? "General")}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {transaction.rule?.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(transaction.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        {transaction.reward_id === 1 && (
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            <ArrowUpRight className="w-4 h-4" />+{transaction.amount} RP
          </div>
        )}
        {transaction.reward_id === 2 && (
          <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
            <ArrowUpRight className="w-4 h-4" />+{transaction.amount} SC
          </div>
        )}
      </div>
    </div>
  )
}
