module.exports = {
	useTabs: true,
	semi: false,
	singleQuote: true,
	trailingComma: 'es5',
	bracketSpacing: true,
	arrowParens: 'always',
	jsxBracketSameLine: false,
	quoteProps: 'consistent',
	plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
	importOrder: ['^[./]', '^@/(.*)$'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
}
