export function saveRecord<T extends { id: string }>(
	records: T[],
	entry: T,
): T[] {
	return records.some((record) => record.id === entry.id)
		? records.map((record) => (record.id === entry.id ? entry : record))
		: [...records, entry];
}
