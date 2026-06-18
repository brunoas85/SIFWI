export function f1(valor: string | number | undefined | null): string {
  if (valor === undefined || valor === null || valor === '') return '-'
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  return isNaN(num) ? '-' : num.toFixed(1)
}

export function f2(valor: string | number | undefined | null): string {
  if (valor === undefined || valor === null || valor === '') return '-'
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  return isNaN(num) ? '-' : num.toFixed(2)
}
