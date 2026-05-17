document.addEventListener('DOMContentLoaded', async () => {
  const { unsplashKey, pexelsKey } = await chrome.storage.sync.get(['unsplashKey', 'pexelsKey']);
  if (unsplashKey) document.getElementById('unsplashKey').value = unsplashKey;
  if (pexelsKey) document.getElementById('pexelsKey').value = pexelsKey;
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
  const statusEl = document.getElementById('saveStatus');

  if (!unsplashKey && !pexelsKey) {
    showSaveStatus('请至少配置一个 API 密钥', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ unsplashKey, pexelsKey });
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
