import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  FileSpreadsheet,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Compass,
  BookOpen,
  LucideProps,
} from 'lucide-react';

export type IconName =
  'student' | 'admin' | 'exam' | 'analytics' | 'status' | 'warning' | 'navigation' | 'resource';

export interface IconProps extends LucideProps {
  name: IconName;
  size?: number;
  className?: string;
}

export const IconRegistry: Record<IconName, React.FC<LucideProps>> = {
  student: GraduationCap,
  admin: ShieldCheck,
  exam: FileSpreadsheet,
  analytics: BarChart3,
  status: CheckCircle2,
  warning: AlertTriangle,
  navigation: Compass,
  resource: BookOpen,
};

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = '', ...props }) => {
  const Component = IconRegistry[name] || BookOpen;
  return <Component size={size} className={className} {...props} />;
};

export const StudentIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="student" {...props} />
);
export const AdminIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="admin" {...props} />
);
export const ExamIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="exam" {...props} />
);
export const StatusIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="status" {...props} />
);
export const NavigationIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="navigation" {...props} />
);
export const ResourceIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon name="resource" {...props} />
);
