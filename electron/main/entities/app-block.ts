import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class AppBlock {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  processName: string

  @Column()
  displayName: string

  @Column({ type: 'varchar', nullable: true })
  path: string | null
}
