document.addEventListener('DOMContentLoaded', async () => {
  const { unsplashKey, pexelsKey, openrouterKey } = await chrome.storage.sync.get(['unsplashKey', 'pexelsKey', 'openrouterKey']);
  if (unsplashKey) document.getElementById('unsplashKey').value = unsplashKey;
  if (pexelsKey) document.getElementById('pexelsKey').value = pexelsKey;
  if (openrouterKey) document.getElementById('openrouterKey').value = openrouterKey;
});

document.querySelectorAll('.toggle-visibility').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '隐藏';
    } else {
      input.type = 'password';
      btn.textContent = '显示';
    }
  });
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  const unsplashKey = document.getElementById('unsplashKey').value.trim();
  const pexelsKey = document.getElementById('pexelsKey').value.trim();
  const openrouterKey = document.getElementById('openrouterKey').value.trim();

  if (!unsplashKey && !pexelsKey) {
    showSaveStatus('请至少配置一个图片搜索 API 密钥', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ unsplashKey, pexelsKey, openrouterKey });
    showSaveStatus('✅ 保存成功！密钥已安全存储在本地', 'success');
  } catch (err) {
    showSaveStatus(`❌ 保存失败：${err.message}`, 'error');
  }
});

function showSaveStatus(msg, type) {
  const el = document.getElementById('saveStatus');
  el.textContent = msg;
  el.className = `save-status ${type}`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.className = 'save-status hidden';
  }, 3000);
}
