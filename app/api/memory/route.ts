import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MEMORY_FILE = path.join(process.cwd(), 'docs/learning/memory.json');

export async function GET() {
  try {
    const data = await fs.readFile(MEMORY_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (e) {
    return NextResponse.json({ experiences: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let memory: { experiences: any[] } = { experiences: [] };
    
    try {
      const data = await fs.readFile(MEMORY_FILE, 'utf-8');
      memory = JSON.parse(data);
    } catch (e) {
      // File doesn't exist yet, which is fine
    }

    memory.experiences.push({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...body
    });

    await fs.mkdir(path.dirname(MEMORY_FILE), { recursive: true });
    await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
    
    return NextResponse.json({ success: true, message: "Experience stored successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
