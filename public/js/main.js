// public/js/main.js - JavaScript personalizado
document.addEventListener('DOMContentLoaded', function() {
    // Destaca o dia atual no calendário
    const today = new Date().toISOString().split('T')[0];
    const todayElement = document.querySelector(`[data-date="${today}"]`);
    if (todayElement) {
      todayElement.classList.add('today');
    }
    
    // Inicializa tooltips do Bootstrap
    $('[data-toggle="tooltip"]').tooltip();
    
    // Função para copiar o link de compartilhamento
    window.copyShareLink = function() {
      const shareLink = document.getElementById('shareLink');
      if (shareLink) {
        shareLink.select();
        document.execCommand('copy');
        alert('Link copiado para a área de transferência!');
      }
    };
    
    // Função para compartilhar no WhatsApp
    window.shareOnWhatsApp = function() {
      const shareLink = document.getElementById('shareLink').value;
      const shareText = encodeURIComponent('Calendário de cuidados da nossa família: ') + encodeURIComponent(shareLink);
      window.open('https://wa.me/?text=' + shareText, '_blank');
    };
  });
  