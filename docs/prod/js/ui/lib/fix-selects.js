$(document).ready(function () {
  $("select").each(function () {
    $(this).val($(this).find('option[selected]').val());
  });
});
