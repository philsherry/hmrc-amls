$(function () {

  // radio button show/hide
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

  // check box other
  $('*[data-other]').each(function () {
    var $this = $(this);
    var $target = $($this.data('other'));
    $this.on('change', function () {
      $target.toggle();
    });
  });
});