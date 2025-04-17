import { Request } from 'express';
import { File as MulterFile } from 'multer';

declare global {
    namespace Express {
        interface Request {
            file?: MulterFile;
            files?: { [fieldname: string]: MulterFile[] };
        }
    }
}
