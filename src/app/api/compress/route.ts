import { NextRequest, NextResponse } from 'next/server';
import tinify from 'tinify';

// 设置 TinyPNG API key
tinify.key = process.env.TINYPNG_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 将文件转换为 Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 使用 TinyPNG 压缩图片
    const result = await tinify.fromBuffer(buffer).toBuffer();

    // 返回压缩后的图片数据
    return new NextResponse(result, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': result.length.toString(),
      },
    });
  } catch (error) {
    console.error('压缩失败:', error);
    return NextResponse.json(
      { error: '压缩失败' },
      { status: 500 }
    );
  }
} 