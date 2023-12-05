import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', nullable: true })
  _id: string | null

  @Column({ type: 'varchar' })
  activityName: string

  @Column({ type: 'varchar', nullable: true })
  activityDisplayName: string | null

  @Column({ type: 'varchar' })
  activityType: string

  @Column({ type: 'varchar', nullable: true })
  activityIcon: string | null

  @Column({ type: 'text', nullable: true })
  activityMetadata: string | null

  @Column({ type: 'integer', nullable: true })
  activityTimeStart: number | null

  @Column({ type: 'integer', nullable: true })
  duration: number | null

  @Column({ type: 'integer', nullable: true })
  questionable: boolean | null

  @Column({ type: 'varchar', unique: true, nullable: true })
  localKey: string | null

  @Column({ type: 'integer' })
  lastUpdated: number
}
