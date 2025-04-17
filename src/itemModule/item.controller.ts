import { Response, Request, NextFunction } from 'express';
import { uploadToS3Bucket } from '../utils/generic/fileUpload';
import { ItemModel } from './item.model';

export const addEditItem = async (req: any, res: Response) => {
  try {
    let itemDetail: any;

    let {
      itemId = 0,
      itemName,
      petPoojaItemId,
      image
    } = req.body;

    if (req.files == null ? 0 : Object.keys(req.files).length > 0) {
      for (const key in req.files) {
        let S3Response: any;
        let fileName = `${req.files[key].name}`;
        let data = req.files[key].data;
        let fileSize = `${req.files[key].size}`;
        await uploadToS3Bucket(fileName, data).then(async (data: any) => {
          S3Response = data;
        });
        image = S3Response!.Location;
      }
    }

    let query: any = {
      itemName,
      petPoojaItemId,
      image,
    };

    if (itemId == 0) {
      itemDetail = await ItemModel.create(query);
    } else {
      itemDetail = await ItemModel.findByIdAndUpdate(itemId, query, {
        new: true,
        runValidators: true
      });
    }
    return res.status(200).json({
      success: true,
      result: itemDetail
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const fetchAllItem = async (req: Request, res: Response) => {
  try {
    const items = await ItemModel.find({
      isDeleted: false
    }).sort({ createdAt: -1 });

    if (items) {
      return res.status(200).json({
        result: items,
        success: true
      });
    } else {
      return res.status(200).json({
        success: false
      });
    }
  } catch (e) {
    return res.status(200).json({
      success: false,
      error: e
    });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await ItemModel.findByIdAndUpdate(id, {
      isDeleted: true
    });

    if (item) {
      return res.status(200).json({
        result: item,
        success: true
      });
    } else {
      return res.status(200).json({
        success: false
      });
    }
  } catch (e) {
    return res.status(200).json({
      success: false,
      error: e
    });
  }
};
