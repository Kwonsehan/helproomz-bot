// ============================================
// app/api/seed/route.ts — 정책 데이터 임베딩 API
// 최초 1회 실행하여 DB에 임베딩 벡터를 저장합니다
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { createEmbedding } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  // 보안: 서비스 롤 키 검증
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  try {
    // 임베딩이 없는 정책 데이터 조회
    const { data: policies, error } = await supabaseAdmin
      .from('policies')
      .select('id, title, content, benefit')
      .is('embedding', null);

    if (error) throw error;
    if (!policies || policies.length === 0) {
      return NextResponse.json({ message: '임베딩할 데이터가 없습니다.' });
    }

    let successCount = 0;

    // 각 정책에 임베딩 벡터 생성 후 저장
    for (const policy of policies) {
      // 임베딩용 텍스트: 제목 + 내용 + 혜택 결합
      const textToEmbed = `${policy.title}\n${policy.content}\n${policy.benefit || ''}`;
      const embedding = await createEmbedding(textToEmbed);

      const { error: updateError } = await supabaseAdmin
        .from('policies')
        .update({ embedding })
        .eq('id', policy.id);

      if (!updateError) successCount++;

      // API 레이트 리밋 방지 (100ms 딜레이)
      await new Promise(r => setTimeout(r, 100));
    }

    return NextResponse.json({
      message: `임베딩 완료: ${successCount}/${policies.length}개`,
    });
  } catch (error) {
    console.error('임베딩 오류:', error);
    return NextResponse.json({ error: '임베딩 실패' }, { status: 500 });
  }
}
