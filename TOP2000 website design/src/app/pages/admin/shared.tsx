import React, { useEffect, useState } from 'react';

export const ITEMS_PER_PAGE = 10;

export type SortDirection = 'asc' | 'desc';

export function paginateItems<T>(items: T[], currentPage: number) {
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
}

export function getVisiblePageNumbers(currentPage: number, totalPages: number) {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	if (currentPage <= 4) {
		return [1, 2, 3, 4, 5, 'ellipsis', totalPages] as const;
	}

	if (currentPage >= totalPages - 3) {
		return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
	}

	return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages] as const;
}

export function compareValues(leftValue: string | number, rightValue: string | number, direction: SortDirection) {
	const comparison = typeof leftValue === 'number' && typeof rightValue === 'number'
		? (leftValue as number) - (rightValue as number)
		: String(leftValue).localeCompare(String(rightValue), 'nl', { sensitivity: 'base' });

	return direction === 'asc' ? comparison : -comparison;
}

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
	const visiblePages = getVisiblePageNumbers(currentPage, totalPages);
	const [pageInput, setPageInput] = useState(String(currentPage));

	useEffect(() => {
		setPageInput(String(currentPage));
	}, [currentPage]);

	const submitPage = () => {
		const parsedPage = Number.parseInt(pageInput, 10);
		if (Number.isNaN(parsedPage)) {
			setPageInput(String(currentPage));
			return;
		}

		onPageChange(Math.min(Math.max(parsedPage, 1), totalPages));
	};

	return (
		<div className="flex items-center gap-2 flex-wrap justify-end">
			<button
				onClick={() => onPageChange(Math.max(1, currentPage - 1))}
				disabled={currentPage === 1}
				className="px-3 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
			>
				&lt;
			</button>

			{visiblePages.map((page, index) => page === 'ellipsis' ? (
				<span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
					...
				</span>
			) : (
				<button
					key={page}
					onClick={() => onPageChange(page)}
					className={`px-3 py-2 rounded-lg border transition-colors ${page === currentPage
						? 'bg-primary text-primary-foreground border-primary'
						: 'border-border hover:bg-secondary'
						}`}
				>
					{page}
				</button>
			))}

			<button
				onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
				disabled={currentPage === totalPages}
				className="px-3 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
			>
				&gt;
			</button>

			<div className="flex items-center gap-2 ml-2">
				<input
					type="number"
					min={1}
					max={totalPages}
					value={pageInput}
					onChange={(event) => setPageInput(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							submitPage();
						}
					}}
					className="w-20 px-3 py-2 rounded-lg border border-border bg-background"
					aria-label="Ga naar pagina"
				/>
				<button
					onClick={submitPage}
					className="px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
				>
					Ga
				</button>
			</div>
		</div>
	);
}

type SortHeaderProps = {
	label: string;
	isActive: boolean;
	direction: SortDirection;
	onClick: () => void;
};

export function SortHeader({ label, isActive, direction, onClick }: SortHeaderProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex items-center gap-2 hover:text-primary transition-colors text-left"
		>
			<span className="font-semibold">{label}</span>
			<span className="text-xs text-muted-foreground">{isActive ? (direction === 'asc' ? '▲' : '▼') : '↕'}</span>
		</button>
	);
}

export function ProgressRing({ percentage, label, count, total, strokeColor }: { percentage: number, label: string, count: number, total: number, strokeColor: string }) {
	const radius = 35;
	const strokeWidth = 6;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<div className="flex flex-col items-center justify-center text-center p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 flex-1">
			<div className="relative w-24 h-24 flex items-center justify-center">
				<svg className="w-full h-full transform -rotate-90">
					{/* Track Circle */}
					<circle
						cx="48"
						cy="48"
						r={radius}
						stroke="rgba(255, 255, 255, 0.08)"
						strokeWidth={strokeWidth}
						fill="transparent"
					/>
					{/* Progress Circle */}
					<circle
						cx="48"
						cy="48"
						r={radius}
						stroke={strokeColor}
						strokeWidth={strokeWidth}
						fill="transparent"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						className="transition-all duration-1000 ease-out"
					/>
				</svg>
				<span className="absolute text-xl font-extrabold tracking-tight text-foreground">{percentage}%</span>
			</div>
			<h4 className="font-bold text-sm text-foreground mt-3">{label}</h4>
			<span className="text-xs text-muted-foreground mt-1 font-semibold">{count} / {total} gekoppeld</span>
		</div>
	);
}

export const getRelativeTimeString = (dateString: string): string => {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHr = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHr / 24);

	if (diffSec < 5) return 'Zojuist';
	if (diffSec < 60) return `${diffSec} sec. geleden`;
	if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minuut' : 'minuten'} geleden`;
	if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? 'uur' : 'uren'} geleden`;
	if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`;
	return date.toLocaleDateString('nl-NL', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
};
