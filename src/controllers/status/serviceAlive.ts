import { Request, Response } from 'express';

export const serviceAlive = async (req: Request, res: Response): Promise<void> => {
    const service = true;
    if(service){
        res.status(200).json({ service: true, message: 'El servicio está habilitado' });
    }else{
        res.status(503).json({ service: false, message: 'El servicio está fuera de servicio' });
    }
};
