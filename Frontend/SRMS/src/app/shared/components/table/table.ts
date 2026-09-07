import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html'
})
export class TableComponent<T = any> {
  // Inputs
  data = input<T[]>([]);
  columns = input<TableColumn[]>([]);
  totalItems = input<number>(0);
  pageSize = input<number>(10);
  pageIndex = input<number>(0);
  sortField = input<string>('');
  sortDirection = input<'asc' | 'desc'>('asc');
  actions = input<Array<{ label: string; name: string; class?: string }>>([]);

  // Outputs
  pageChange = output<{ pageIndex: number; pageSize: number }>();
  sortChange = output<{ field: string; direction: 'asc' | 'desc' }>();
  actionClick = output<{ action: string; row: T }>();

  // Computed Pagination Helpers
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);
  startIndex = computed(() => this.totalItems() === 0 ? 0 : this.pageIndex() * this.pageSize() + 1);
  endIndex = computed(() => Math.min((this.pageIndex() + 1) * this.pageSize(), this.totalItems()));

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    const currentField = this.sortField();
    const currentDir = this.sortDirection();

    let direction: 'asc' | 'desc' = 'asc';
    if (currentField === column.key && currentDir === 'asc') {
      direction = 'desc';
    }

    this.sortChange.emit({ field: column.key, direction });
  }

  onPageChange(index: number): void {
    if (index >= 0 && index < this.totalPages()) {
      this.pageChange.emit({ pageIndex: index, pageSize: this.pageSize() });
    }
  }

  onPageSizeChange(event: Event): void {
    const size = +(event.target as HTMLSelectElement).value;
    this.pageChange.emit({ pageIndex: 0, pageSize: size });
  }

  onAction(actionName: string, row: T): void {
    this.actionClick.emit({ action: actionName, row });
  }

  // Safe helper to dynamically resolve cell properties in strict templates
  getCellValue(row: any, key: string): any {
    return row && key ? row[key] : '';
  }
}
