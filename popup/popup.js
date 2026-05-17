const textInput = document.getElementById('textInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const statusDiv = document.getElementById('status');

let currentSource = 'all';

document.querySelectorAll('.source-option').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelector('.source-option.active')?.classList.remove('active');
    el.classList.add('active');
    currentSource = el.dataset.source;
    el.querySelector('input').checked = true;
  });
});

document.getElementById('openOptions').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    doSearch();
  }
});

searchBtn.addEventListener('click', doSearch);

async function doSearch() {
  const query = textInput.value.trim();
  if (!query) {
    showStatus('请输入要搜索的文字', 'error');
    textInput.focus();
    return;
  }
  if (query.length < 2) {
    showStatus('请输入至少2个字符', 'error');
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = '搜索中...';
  hideStatus();
  showLoading();
  resultsDiv.scrollTop = 0;

  try {
    const { unsplashKey, pexelsKey } = await chrome.storage.sync.get(['unsplashKey', 'pexelsKey']);
    const promises = [];

    if (currentSource === 'all' || currentSource === 'unsplash') {
      if (unsplashKey) {
        promises.push(searchUnsplash(query, unsplashKey));
      }
    }

    if (currentSource === 'all' || currentSource === 'pexels') {
      if (pexelsKey) {
        promises.push(searchPexels(query, pexelsKey));
      }
    }

    if (promises.length === 0) {
      showStatus('请先在设置中配置 API 密钥', 'error');
      showEmptyState();
      return;
    }

    const results = await Promise.allSettled(promises);
    const allImages = [];
    const errors = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allImages.push(...result.value);
      } else {
        errors.push(result.reason?.message || '搜索失败');
      }
    });

    if (allImages.length === 0) {
      const errorMsg = errors.length > 0
        ? `搜索失败：${errors.join('；')}`
        : '未找到相关图片，试试其他关键词';
      showStatus(errorMsg, 'error');
      showEmptyState();
      return;
    }

    renderImages(allImages, query);
  } catch (err) {
    showStatus(`搜索出错：${err.message}`, 'error');
    showEmptyState();
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = '搜索配图';
  }
}

async function searchUnsplash(query, apiKey) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Client-ID ${apiKey}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Unsplash ${res.status}: ${err.errors?.[0] || res.statusText}`);
  }
  const data = await res.json();
  return data.results.map(photo => ({
    id: `unsplash-${photo.id}`,
    source: 'unsplash',
    thumb: photo.urls.thumb,
    small: photo.urls.small,
    regular: photo.urls.regular,
    full: photo.urls.full,
    raw: photo.urls.raw,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    photoUrl: photo.links.html,
    alt: photo.alt_description || query,
    width: photo.width,
    height: photo.height,
  }));
}

async function searchPexels(query, apiKey) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape`;
  const res = await fetch(url, {
    headers: { 'Authorization': apiKey }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Pexels ${res.status}: ${err.error || res.statusText}`);
  }
  const data = await res.json();
  return data.photos.map(photo => ({
    id: `pexels-${photo.id}`,
    source: 'pexels',
    thumb: photo.src.tiny,
    small: photo.src.small,
    regular: photo.src.medium,
    full: photo.src.large,
    raw: photo.src.original,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    photoUrl: photo.url,
    alt: photo.alt || query,
    width: photo.width,
    height: photo.height,
  }));
}

function renderImages(images, query) {
  resultsDiv.innerHTML = '';

  const grouped = {};
  for (const img of images) {
    if (!grouped[img.source]) grouped[img.source] = [];
    grouped[img.source].push(img);
  }

  for (const [source, imgs] of Object.entries(grouped)) {
    const label = document.createElement('div');
    label.className = 'source-label';
    label.textContent = source === 'unsplash' ? '📷 Unsplash 搜索结果' : '📷 Pexels 搜索结果';
    resultsDiv.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'image-grid';

    for (const img of imgs) {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.dataset.url = img.regular;

      card.innerHTML = `
        <img src="${img.thumb}" alt="${escapeHtml(img.alt)}" loading="lazy">
        <span class="source-badge ${img.source}">${img.source}</span>
        <div class="photographer">${escapeHtml(img.photographer)}</div>
        <div class="overlay">
          <span class="overlay-text">点击复制</span>
        </div>
      `;

      card.addEventListener('click', () => copyImageUrl(img.regular));
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        copyImageUrl(img.regular);
      });

      grid.appendChild(card);
    }

    resultsDiv.appendChild(grid);
  }

  const count = images.length;
  const info = document.createElement('div');
  info.style.cssText = 'text-align:center;padding:10px 0 4px;font-size:11px;color:#999';
  info.textContent = `共找到 ${count} 张图片，点击任意图片复制 URL`;
  resultsDiv.appendChild(info);
}

function copyImageUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast('✅ 图片 URL 已复制到剪贴板');
  }).catch(() => {
    showToast('❌ 复制失败，请手动复制');
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 2000);
}

function showStatus(msg, type) {
  statusDiv.textContent = msg;
  statusDiv.className = `status ${type}`;
}

function hideStatus() {
  statusDiv.className = 'status hidden';
}

function showLoading() {
  resultsDiv.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>正在搜索配图...</p>
    </div>
  `;
}

function showEmptyState() {
  resultsDiv.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🖼️</div>
      <p>输入文字后点击搜索，查找真实配图</p>
      <p class="hint">支持选中文字后右键 → 「搜索配图」</p>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.local.get('pendingSearchText');
  if (result.pendingSearchText) {
    textInput.value = result.pendingSearchText;
    chrome.storage.local.remove('pendingSearchText');
    doSearch();
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || '',
      });
      const selectedText = results?.[0]?.result?.trim();
      if (selectedText && selectedText.length >= 2) {
        textInput.value = selectedText;
      }
    }
  } catch (e) {
    // ignore - no active tab or scripting not allowed
  }
});
