import React from 'react';
import { LucideProps } from 'lucide-react';
export type IconName =
  'student' | 'admin' | 'exam' | 'analytics' | 'status' | 'warning' | 'navigation' | 'resource';
export interface IconProps extends LucideProps {
  name: IconName;
  size?: number;
  className?: string;
}
export declare const IconRegistry: Record<IconName, React.FC<LucideProps>>;
export declare const Icon: React.FC<IconProps>;
export declare const StudentIcon: React.FC<Omit<IconProps, 'name'>>;
export declare const AdminIcon: React.FC<Omit<IconProps, 'name'>>;
export declare const ExamIcon: React.FC<Omit<IconProps, 'name'>>;
export declare const StatusIcon: React.FC<Omit<IconProps, 'name'>>;
export declare const NavigationIcon: React.FC<Omit<IconProps, 'name'>>;
export declare const ResourceIcon: React.FC<Omit<IconProps, 'name'>>;
