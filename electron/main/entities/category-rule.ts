import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class CategoryRule {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  categoryId: number

  @Column()
  action: string
}
