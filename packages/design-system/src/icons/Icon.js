import { jsx as _jsx } from 'react/jsx-runtime';
import {
  GraduationCap,
  ShieldCheck,
  FileSpreadsheet,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Compass,
  BookOpen,
} from 'lucide-react';
export const IconRegistry = {
  student: GraduationCap,
  admin: ShieldCheck,
  exam: FileSpreadsheet,
  analytics: BarChart3,
  status: CheckCircle2,
  warning: AlertTriangle,
  navigation: Compass,
  resource: BookOpen,
};
export const Icon = ({ name, size = 20, className = '', ...props }) => {
  const Component = IconRegistry[name] || BookOpen;
  return _jsx(Component, { size: size, className: className, ...props });
};
export const StudentIcon = (props) => _jsx(Icon, { name: 'student', ...props });
export const AdminIcon = (props) => _jsx(Icon, { name: 'admin', ...props });
export const ExamIcon = (props) => _jsx(Icon, { name: 'exam', ...props });
export const StatusIcon = (props) => _jsx(Icon, { name: 'status', ...props });
export const NavigationIcon = (props) => _jsx(Icon, { name: 'navigation', ...props });
export const ResourceIcon = (props) => _jsx(Icon, { name: 'resource', ...props });
