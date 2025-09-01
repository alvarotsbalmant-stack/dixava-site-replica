import React from 'react';
import { SpecialSection } from '@/types/specialSections';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface SpecialSectionListProps {
  sections: SpecialSection[];
  onEdit: (section: SpecialSection) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

const SpecialSectionList: React.FC<SpecialSectionListProps> = ({ sections, onEdit, onDelete, loading }) => {
  if (loading) {
    return <p className="text-center text-gray-400 py-4">Carregando seções...</p>;
  }

  if (sections.length === 0) {
    return <p className="text-center text-gray-400 py-4">Nenhuma seção especial encontrada. Clique em "Nova Seção Especial" para criar uma.</p>;
  }

  return (
    <Table className="text-white">
      <TableHeader>
        <TableRow className="border-gray-700 hover:bg-gray-700/50">
          <TableHead className="text-white">Título</TableHead>
          <TableHead className="text-white">Ordem</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-white text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sections.map((section) => (
          <TableRow key={section.id} className="border-gray-700 hover:bg-gray-700/50">
            <TableCell className="font-medium">{section.title}</TableCell>
            <TableCell>{section.display_order ?? '-'}</TableCell>
            <TableCell>
              <Badge variant={section.is_active ? 'default' : 'destructive'}>
                {section.is_active ? 'Ativa' : 'Inativa'}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(section)} className="text-white border-gray-600 hover:bg-gray-700 hover:text-white">
                <Edit className="w-4 h-4 mr-1" /> Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(section.id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Excluir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SpecialSectionList;

