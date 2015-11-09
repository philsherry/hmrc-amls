$(function () {

  $('*[data-target]').each(function () { 
    var $this = $(this);
    var $input = $this.children('input[type="radio"]');
    var $others = $this.siblings().children('input[type="radio"]');
    var $target = $($this.data('target'));
    $input.on('change', function () {
      $target.show();
    });
    $others.on('change', function () {
      $target.hide();
    })
  });

});