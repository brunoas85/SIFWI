import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface Props {
  titulo: string
  unidad: string
  datos: Record<string, string | number | null>[]
  años: number[]
  colores: Record<number, string>
  esSuma?: boolean
}

export function GraficoLinea({ titulo, unidad, datos, años, colores, esSuma }: Props) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm">{titulo}</h3>
        <span className="text-xs text-gray-400">
          {esSuma ? 'suma mensual' : 'promedio mensual'} · {unidad}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={datos} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            width={48}
            tickFormatter={v => `${v}${unidad}`}
          />
          <Tooltip
            formatter={(value) => {
              if (typeof value === 'number') return [`${value.toFixed(1)} ${unidad}`, '']
              return ['-', '']
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {años.map(año => (
            <Line
              key={año}
              type="monotone"
              dataKey={String(año)}
              name={String(año)}
              stroke={colores[año]}
              strokeWidth={2}
              dot={false}
              connectNulls
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
