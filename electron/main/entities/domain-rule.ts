import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class DomainRule {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  domain: string

  @Column()
  action: string
}
