import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as qiniu from 'qiniu';

// 七牛云配置
const accessKey = process.env.QINIU_ACCESS_KEY || '';
const secretKey = process.env.QINIU_SECRET_KEY || '';
const bucket = process.env.QINIU_BUCKET || '';
const domain = process.env.QINIU_DOMAIN || '';

// 创建七牛云上传凭证
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const putPolicy = new qiniu.rs.PutPolicy({
  scope: bucket,
  expires: 7200
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    // 生成上传凭证
    const uploadToken = putPolicy.uploadToken(mac);
    
    // 生成唯一的文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const key = `uploads/${timestamp}-${randomStr}.${ext}`;

    // 将文件转换为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到七牛云
    const config = new qiniu.conf.Config();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    const uploadResult = await new Promise<{ url: string }>((resolve, reject) => {
      formUploader.put(uploadToken, key, buffer, putExtra, (err, body, info) => {
        if (err) {
          console.error('七牛云上传失败:', err);
          reject(new Error('上传失败'));
          return;
        }

        if (info.statusCode !== 200) {
          console.error('七牛云上传失败:', info);
          reject(new Error('上传失败'));
          return;
        }

        // 构建文件URL
        const fileUrl = `${domain}/${key}`;
        resolve({ url: fileUrl });
      });
    });

    // 检查用户是否存在，不存在则创建用户
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { id: userId }
      });
    }

    // 保存到数据库
    const image = await prisma.image.create({
      data: {
        name: file.name,
        url: uploadResult.url,
        size: file.size,
        format: file.type.split('/')[1],
        userId: userId
      }
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('上传处理失败:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const images = await prisma.image.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json({ error: '获取历史记录失败' }, { status: 500 });
  }
} 