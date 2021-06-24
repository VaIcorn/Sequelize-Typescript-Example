import { BelongsToManyAddAssociationMixin, BelongsToManyCountAssociationsMixin, BelongsToManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, DataTypes, Model, Optional, Sequelize } from "sequelize";
import { Entity } from "../annotations/entity";
import { UserEntity } from "./user";

interface ProjectAttributes {
    id: number;
    name: string;
}

// Some attributes are optional in `User.build` and `User.create` calls
interface ProjectCreationAttributes extends Optional<ProjectAttributes, "id"> { }

@Entity()
class ProjectEntity extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
    public id!: number;
    public name!: string;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    //
    public getUserEntities!: BelongsToManyGetAssociationsMixin<UserEntity>; // Note the null assertions!
    public addUserEntity!: BelongsToManyAddAssociationMixin<UserEntity, number>;
    public hasUserEntity!: BelongsToManyHasAssociationMixin<UserEntity, number>;
    public countUserEntities!: BelongsToManyCountAssociationsMixin;
    public createUserEntity!: BelongsToManyCreateAssociationMixin<UserEntity>;
  
    public readonly userEntities?: UserEntity[]; // Note this is optional since it's only populated when explicitly requested in code

    public static async initTable(sequelize: Sequelize) {
        return ProjectEntity.init({
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          name: {
            type: DataTypes.STRING(255),
            allowNull: false
          }
        }, {sequelize, tableName: 'PROJECTENTITY'})
      }
    
      public static async initAssociations() {
        await ProjectEntity.belongsToMany(UserEntity, { through: 'USER_PROJECT'});
      }
}


export { ProjectEntity };
