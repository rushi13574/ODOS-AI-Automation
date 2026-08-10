import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateTaskProgressDto {
  @IsEnum(['not_started', 'in_progress', 'completed'])
  status!: string;

  @IsOptional()
  @IsNumber()
  actualMinutes?: number;
}
