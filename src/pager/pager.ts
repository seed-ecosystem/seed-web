export interface Pager<T> {
  loadPage(): Promise<Page<T>>
}

export interface Page<T> {
  data: T[]
  remaining: Pager<T> | null
}
