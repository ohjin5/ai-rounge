import { APPS_SCRIPT_URL } from '../config/api';

export async function fetchIdeas() {
  const url = `${APPS_SCRIPT_URL}?action=ideas&t=${Date.now()}`;

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(
      `아이디어 조회 실패: ${response.status}`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || '아이디어 조회에 실패했습니다.'
    );
  }

  return Array.isArray(result.data)
    ? result.data
    : [];
}

export async function likeIdea(
  ideaId: string,
  clientId: string
) {
  const body = new URLSearchParams({
    action: 'like',
    ideaId,
    clientId
  });

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body
  });

  if (!response.ok) {
    throw new Error(
      `좋아요 요청 실패: ${response.status}`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || '좋아요 처리에 실패했습니다.'
    );
  }

  return result;
}
