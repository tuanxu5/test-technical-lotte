import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <table className={`sys-table ${className}`} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  ...props
}) => (
  <thead {...props}>{children}</thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  ...props
}) => (
  <tbody {...props}>{children}</tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  ...props
}) => (
  <tr {...props}>{children}</tr>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  ...props
}) => (
  <td {...props}>{children}</td>
);

export const TableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableHeaderCellElement>> = ({
  children,
  ...props
}) => (
  <th {...props}>{children}</th>
);
