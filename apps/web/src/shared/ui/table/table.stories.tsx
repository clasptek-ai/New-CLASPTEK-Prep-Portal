import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from './Table';

export default {
  title: 'Data Display/Table',
  component: Table,
};

export const Default = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHeaderCell>Module</TableHeaderCell>
        <TableHeaderCell>Band Score</TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Listening</TableCell>
        <TableCell>8.5</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
