import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password:string;
  age?: number;
}

export interface IDocs extends Document {
  email:string;
  filename : string;
  extractedText : string
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
});

const fileSchema:Schema = new Schema({
    email: { type: String, required: true },
    filename: {type: String,required:true},
    extractedText : {type: String,required:true}
})

export const UserModel = mongoose.model<IUser>('User', userSchema);
export const DocsModel = mongoose.model<IDocs>('Docs', fileSchema);
