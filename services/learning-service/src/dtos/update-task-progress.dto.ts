import { IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateTaskProgressDto {
  @IsString()
  @IsNotEmpty()
  learningGoalId!: string;

  @IsEnum(['not_started', 'in_progress', 'completed'])
  status!: string;

  @IsOptional()
  @IsNumber()
  actualMinutes?: number;
}
