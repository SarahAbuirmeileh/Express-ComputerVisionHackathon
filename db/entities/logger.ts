import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Logger extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => "CURRENT_TIMESTAMP(6)"
  })
  createdAt: Date;

  @Column({length:5000, nullable:false})
  result:string

  @Column({ nullable:false})
  imgPath:string

  @Column({nullable:false, length:7000})
  fileURL:string
}