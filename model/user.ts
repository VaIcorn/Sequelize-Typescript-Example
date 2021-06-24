import { Association, BelongsToManyAddAssociationMixin, BelongsToManyCountAssociationsMixin, BelongsToManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, DataTypes, Model, Optional, Sequelize } from "sequelize";
import { Entity } from "../annotations/entity";
import { ProjectEntity } from "./project";

interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
}

class UserDTO {
  private id!: number;
  private firstName!: string;
  private lastName!: string;

  constructor(id?: number, firstName?: string, lastName?: string) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  public getId(): number {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getFirstName(): string {
    return this.firstName;
  }
  
  public setFirstName(firstName: string): void {
    this.firstName = firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public setLastName(lastName: string): void {
    this.lastName = lastName;
  }

}

// Some attributes are optional in `User.build` and `User.create` calls
interface UserCreationAttributes extends Optional<UserAttributes, "id"> { }

@Entity()
class UserEntity extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getProjectEntities!: BelongsToManyGetAssociationsMixin<ProjectEntity>; // Note the null assertions!
  public addProjectEntity!: BelongsToManyAddAssociationMixin<ProjectEntity, number>;
  public hasProjectEntity!: BelongsToManyHasAssociationMixin<ProjectEntity, number>;
  public countProjectEntities!: BelongsToManyCountAssociationsMixin;
  public createProjectEntity!: BelongsToManyCreateAssociationMixin<ProjectEntity>;

  public readonly ProjectEntities?: ProjectEntity[]; // Note this is optional since it's only populated when explicitly requested in code

  public static associations: {
    ProjectEntities: Association<UserEntity, ProjectEntity>;
  };

  public static async initTable(sequelize: Sequelize) {
    return UserEntity.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }, { sequelize, tableName: 'USERENTITY' })
  }

  public static async initAssociations() {
    await UserEntity.belongsToMany(ProjectEntity, { through: 'USER_PROJECT' });
  }
}


export { UserEntity, UserAttributes, UserDTO };
